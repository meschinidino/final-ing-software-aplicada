package domain

import "time"

type User struct {
	ID           int64     `gorm:"primaryKey" json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`

	TodoLists []TodoList `json:"todo_lists,omitempty"`
	Tags      []Tag      `json:"tags,omitempty"`
}

type TodoList struct {
	ID          int64     `gorm:"primaryKey" json:"id"`
	UserID      int64     `json:"user_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	Tasks []Task `json:"tasks,omitempty"`
}

type TaskStatus string

const (
	TaskStatusPending    TaskStatus = "pending"
	TaskStatusInProgress TaskStatus = "in_progress"
	TaskStatusDone       TaskStatus = "done"
)

type Task struct {
	ID          int64      `gorm:"primaryKey" json:"id"`
	TodoListID  int64      `json:"todo_list_id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Status      TaskStatus `json:"status"`
	DueDate     *time.Time `json:"due_date"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`

	Tags []Tag `gorm:"many2many:task_tags;" json:"tags,omitempty"`
}

type Tag struct {
	ID        int64     `gorm:"primaryKey" json:"id"`
	UserID    int64     `json:"user_id"`
	Name      string    `json:"name"`
	Color     string    `json:"color"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Tasks []Task `gorm:"many2many:task_tags;" json:"tasks,omitempty"`
}
