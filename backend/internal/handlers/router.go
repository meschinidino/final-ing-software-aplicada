package handlers

import (
	"errors"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
	"gorm.io/gorm"

	"todolist/backend/internal/auth"
	"todolist/backend/internal/domain"
	"todolist/backend/internal/middleware"
)

type API struct {
	db   *gorm.DB
	auth auth.Service
}

func NewRouter(db *gorm.DB, authService auth.Service) *gin.Engine {
	api := API{db: db, auth: authService}
	router := gin.Default()
	router.Use(corsMiddleware())

	router.GET("/health", api.health)

	router.POST("/api/register", api.register)
	router.POST("/api/authenticate", api.authenticate)

	protected := router.Group("/api", middleware.RequireAuth(authService))
	protected.GET("/todo-lists", api.listTodoLists)
	protected.POST("/todo-lists", api.createTodoList)
	protected.GET("/todo-lists/:id", api.getTodoList)
	protected.PUT("/todo-lists/:id", api.updateTodoList)
	protected.DELETE("/todo-lists/:id", api.deleteTodoList)

	protected.GET("/tasks", api.listTasks)
	protected.POST("/tasks", api.createTask)
	protected.GET("/tasks/:id", api.getTask)
	protected.PUT("/tasks/:id", api.updateTask)
	protected.DELETE("/tasks/:id", api.deleteTask)
	protected.PUT("/tasks/:id/tags", api.replaceTaskTags)

	protected.GET("/tags", api.listTags)
	protected.POST("/tags", api.createTag)
	protected.GET("/tags/:id", api.getTag)
	protected.PUT("/tags/:id", api.updateTag)
	protected.DELETE("/tags/:id", api.deleteTag)

	return router
}

func corsMiddleware() gin.HandlerFunc {
	allowedOrigins := map[string]bool{
		"http://localhost:4174": true,
		"http://127.0.0.1:4174": true,
		"http://localhost:5173": true,
		"http://127.0.0.1:5173": true,
		"http://localhost:5174": true,
		"http://127.0.0.1:5174": true,
	}

	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		if allowedOrigins[origin] {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Vary", "Origin")
			c.Header("Access-Control-Allow-Headers", "Authorization, Content-Type")
			c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		}
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}

func (api API) health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

type authRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (api API) register(c *gin.Context) {
	var req authRequest
	if !bindJSON(c, &req) {
		return
	}
	email := auth.CanonicalEmail(req.Email)
	if email == "" || strings.TrimSpace(req.Password) == "" {
		badRequest(c, "email and password are required")
		return
	}

	hash, err := auth.HashPassword(req.Password)
	if err != nil {
		serverError(c, err)
		return
	}

	user := domain.User{Email: email, PasswordHash: hash}
	if err := api.db.Create(&user).Error; err != nil {
		if isUniqueViolation(err, "users_email_key") {
			c.JSON(http.StatusConflict, gin.H{"error": "email already registered"})
			return
		}
		serverError(c, err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": user.ID, "email": user.Email})
}

func (api API) authenticate(c *gin.Context) {
	var req authRequest
	if !bindJSON(c, &req) {
		return
	}

	var user domain.User
	if err := api.db.Where("email = ?", auth.CanonicalEmail(req.Email)).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}
	if !auth.CheckPassword(user.PasswordHash, req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	token, expiresAt, err := api.auth.IssueToken(user.ID)
	if err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": token, "expires_at": expiresAt.Format(time.RFC3339)})
}

type todoListRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}

func (api API) listTodoLists(c *gin.Context) {
	var lists []domain.TodoList
	if err := api.db.Where("user_id = ?", currentUser(c)).Order("id").Find(&lists).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, lists)
}

func (api API) createTodoList(c *gin.Context) {
	var req todoListRequest
	if !bindJSON(c, &req) {
		return
	}
	if strings.TrimSpace(req.Title) == "" {
		badRequest(c, "title is required")
		return
	}
	list := domain.TodoList{UserID: currentUser(c), Title: strings.TrimSpace(req.Title), Description: req.Description}
	if err := api.db.Create(&list).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusCreated, list)
}

func (api API) getTodoList(c *gin.Context) {
	list, ok := api.findTodoList(c)
	if !ok {
		return
	}
	c.JSON(http.StatusOK, list)
}

func (api API) updateTodoList(c *gin.Context) {
	list, ok := api.findTodoList(c)
	if !ok {
		return
	}
	var req todoListRequest
	if !bindJSON(c, &req) {
		return
	}
	if strings.TrimSpace(req.Title) == "" {
		badRequest(c, "title is required")
		return
	}
	list.Title = strings.TrimSpace(req.Title)
	list.Description = req.Description
	if err := api.db.Save(&list).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, list)
}

func (api API) deleteTodoList(c *gin.Context) {
	list, ok := api.findTodoList(c)
	if !ok {
		return
	}
	if err := api.db.Delete(&list).Error; err != nil {
		serverError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

type taskRequest struct {
	TodoListID  int64             `json:"todo_list_id"`
	Title       string            `json:"title"`
	Description string            `json:"description"`
	Status      domain.TaskStatus `json:"status"`
	DueDate     *time.Time        `json:"due_date"`
	TagIDs      []int64           `json:"tag_ids"`
}

func (api API) listTasks(c *gin.Context) {
	var tasks []domain.Task
	err := api.db.Preload("Tags").
		Joins("JOIN todo_lists ON todo_lists.id = tasks.todo_list_id").
		Where("todo_lists.user_id = ?", currentUser(c)).
		Order("tasks.id").
		Find(&tasks).Error
	if err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, tasks)
}

func (api API) createTask(c *gin.Context) {
	var req taskRequest
	if !bindJSON(c, &req) {
		return
	}
	if !api.validateTaskRequest(c, req, true) {
		return
	}
	tags, err := api.loadOwnedTags(currentUser(c), req.TagIDs)
	if err != nil {
		notFoundOrError(c, err)
		return
	}

	task := domain.Task{
		TodoListID:  req.TodoListID,
		Title:       strings.TrimSpace(req.Title),
		Description: req.Description,
		Status:      taskStatusOrDefault(req.Status),
		DueDate:     req.DueDate,
	}
	if err := api.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&task).Error; err != nil {
			return err
		}
		return applyTaskTags(tx, &task, tags)
	}); err != nil {
		notFoundOrError(c, err)
		return
	}
	api.db.Preload("Tags").First(&task, task.ID)
	c.JSON(http.StatusCreated, task)
}

func (api API) getTask(c *gin.Context) {
	task, ok := api.findTask(c)
	if !ok {
		return
	}
	c.JSON(http.StatusOK, task)
}

func (api API) updateTask(c *gin.Context) {
	task, ok := api.findTask(c)
	if !ok {
		return
	}
	var req taskRequest
	if !bindJSON(c, &req) {
		return
	}
	if !api.validateTaskRequest(c, req, false) {
		return
	}
	var tags []domain.Tag
	if req.TagIDs != nil {
		var err error
		tags, err = api.loadOwnedTags(currentUser(c), req.TagIDs)
		if err != nil {
			notFoundOrError(c, err)
			return
		}
	}

	task.TodoListID = req.TodoListID
	task.Title = strings.TrimSpace(req.Title)
	task.Description = req.Description
	task.Status = taskStatusOrDefault(req.Status)
	task.DueDate = req.DueDate
	if err := api.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(&task).Error; err != nil {
			return err
		}
		if req.TagIDs != nil {
			return applyTaskTags(tx, &task, tags)
		}
		return nil
	}); err != nil {
		notFoundOrError(c, err)
		return
	}
	api.db.Preload("Tags").First(&task, task.ID)
	c.JSON(http.StatusOK, task)
}

func (api API) deleteTask(c *gin.Context) {
	task, ok := api.findTask(c)
	if !ok {
		return
	}
	if err := api.db.Delete(&task).Error; err != nil {
		serverError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

type tagIDsRequest struct {
	TagIDs []int64 `json:"tag_ids"`
}

func (api API) replaceTaskTags(c *gin.Context) {
	task, ok := api.findTask(c)
	if !ok {
		return
	}
	var req tagIDsRequest
	if !bindJSON(c, &req) {
		return
	}
	tags, err := api.loadOwnedTags(currentUser(c), req.TagIDs)
	if err != nil {
		notFoundOrError(c, err)
		return
	}
	if err := applyTaskTags(api.db, &task, tags); err != nil {
		notFoundOrError(c, err)
		return
	}
	api.db.Preload("Tags").First(&task, task.ID)
	c.JSON(http.StatusOK, task)
}

type tagRequest struct {
	Name  string `json:"name"`
	Color string `json:"color"`
}

func (api API) listTags(c *gin.Context) {
	var tags []domain.Tag
	if err := api.db.Where("user_id = ?", currentUser(c)).Order("id").Find(&tags).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, tags)
}

func (api API) createTag(c *gin.Context) {
	var req tagRequest
	if !bindJSON(c, &req) {
		return
	}
	if strings.TrimSpace(req.Name) == "" {
		badRequest(c, "name is required")
		return
	}
	tag := domain.Tag{UserID: currentUser(c), Name: strings.TrimSpace(req.Name), Color: req.Color}
	if err := api.db.Create(&tag).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "tag name already exists"})
		return
	}
	c.JSON(http.StatusCreated, tag)
}

func (api API) getTag(c *gin.Context) {
	tag, ok := api.findTag(c)
	if !ok {
		return
	}
	c.JSON(http.StatusOK, tag)
}

func (api API) updateTag(c *gin.Context) {
	tag, ok := api.findTag(c)
	if !ok {
		return
	}
	var req tagRequest
	if !bindJSON(c, &req) {
		return
	}
	if strings.TrimSpace(req.Name) == "" {
		badRequest(c, "name is required")
		return
	}
	tag.Name = strings.TrimSpace(req.Name)
	tag.Color = req.Color
	if err := api.db.Save(&tag).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "tag name already exists"})
		return
	}
	c.JSON(http.StatusOK, tag)
}

func (api API) deleteTag(c *gin.Context) {
	tag, ok := api.findTag(c)
	if !ok {
		return
	}
	if err := api.db.Delete(&tag).Error; err != nil {
		serverError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

func (api API) findTodoList(c *gin.Context) (domain.TodoList, bool) {
	id, ok := idParam(c)
	if !ok {
		return domain.TodoList{}, false
	}
	var list domain.TodoList
	if err := api.db.Where("id = ? AND user_id = ?", id, currentUser(c)).First(&list).Error; err != nil {
		notFoundOrError(c, err)
		return domain.TodoList{}, false
	}
	return list, true
}

func (api API) findTask(c *gin.Context) (domain.Task, bool) {
	id, ok := idParam(c)
	if !ok {
		return domain.Task{}, false
	}
	var task domain.Task
	err := api.db.Preload("Tags").
		Joins("JOIN todo_lists ON todo_lists.id = tasks.todo_list_id").
		Where("tasks.id = ? AND todo_lists.user_id = ?", id, currentUser(c)).
		First(&task).Error
	if err != nil {
		notFoundOrError(c, err)
		return domain.Task{}, false
	}
	return task, true
}

func (api API) findTag(c *gin.Context) (domain.Tag, bool) {
	id, ok := idParam(c)
	if !ok {
		return domain.Tag{}, false
	}
	var tag domain.Tag
	if err := api.db.Where("id = ? AND user_id = ?", id, currentUser(c)).First(&tag).Error; err != nil {
		notFoundOrError(c, err)
		return domain.Tag{}, false
	}
	return tag, true
}

func (api API) validateTaskRequest(c *gin.Context, req taskRequest, requireList bool) bool {
	if strings.TrimSpace(req.Title) == "" {
		badRequest(c, "title is required")
		return false
	}
	if requireList && req.TodoListID == 0 {
		badRequest(c, "todo_list_id is required")
		return false
	}
	if req.TodoListID == 0 {
		badRequest(c, "todo_list_id is required")
		return false
	}
	if !validTaskStatus(taskStatusOrDefault(req.Status)) {
		badRequest(c, "invalid task status")
		return false
	}
	var count int64
	if err := api.db.Model(&domain.TodoList{}).Where("id = ? AND user_id = ?", req.TodoListID, currentUser(c)).Count(&count).Error; err != nil {
		serverError(c, err)
		return false
	}
	if count == 0 {
		notFound(c)
		return false
	}
	return true
}

func (api API) loadOwnedTags(userID int64, tagIDs []int64) ([]domain.Tag, error) {
	if len(tagIDs) == 0 {
		return []domain.Tag{}, nil
	}
	var tags []domain.Tag
	if err := api.db.Where("user_id = ? AND id IN ?", userID, tagIDs).Find(&tags).Error; err != nil {
		return nil, err
	}
	if len(tags) != len(uniqueInt64s(tagIDs)) {
		return nil, gorm.ErrRecordNotFound
	}
	return tags, nil
}

func applyTaskTags(db *gorm.DB, task *domain.Task, tags []domain.Tag) error {
	return db.Model(task).Association("Tags").Replace(tags)
}

func bindJSON(c *gin.Context, target interface{}) bool {
	if err := c.ShouldBindJSON(target); err != nil {
		badRequest(c, "invalid JSON request")
		return false
	}
	return true
}

func idParam(c *gin.Context) (int64, bool) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil || id <= 0 {
		badRequest(c, "invalid id")
		return 0, false
	}
	return id, true
}

func currentUser(c *gin.Context) int64 {
	return middleware.CurrentUserID(c)
}

func taskStatusOrDefault(status domain.TaskStatus) domain.TaskStatus {
	if status == "" {
		return domain.TaskStatusPending
	}
	return status
}

func validTaskStatus(status domain.TaskStatus) bool {
	switch status {
	case domain.TaskStatusPending, domain.TaskStatusInProgress, domain.TaskStatusDone:
		return true
	default:
		return false
	}
}

func uniqueInt64s(values []int64) map[int64]struct{} {
	unique := make(map[int64]struct{}, len(values))
	for _, value := range values {
		unique[value] = struct{}{}
	}
	return unique
}

func badRequest(c *gin.Context, message string) {
	c.JSON(http.StatusBadRequest, gin.H{"error": message})
}

func notFound(c *gin.Context) {
	c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
}

func notFoundOrError(c *gin.Context, err error) {
	if errors.Is(err, gorm.ErrRecordNotFound) {
		notFound(c)
		return
	}
	serverError(c, err)
}

func serverError(c *gin.Context, err error) {
	log.Printf("internal server error: %v", err)
	c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
}

func isUniqueViolation(err error, constraintName string) bool {
	var pgErr *pgconn.PgError
	if !errors.As(err, &pgErr) {
		return false
	}
	return pgErr.Code == "23505" && (constraintName == "" || pgErr.ConstraintName == constraintName)
}
