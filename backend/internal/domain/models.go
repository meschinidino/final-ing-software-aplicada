package domain

import "time"

type User struct {
	ID           int64
	Email        string
	PasswordHash string
	CreatedAt    time.Time
	UpdatedAt    time.Time

	TodoLists []TodoList
	Tags      []Tag
}

type TodoList struct {
	ID          int64
	UserID      int64
	Title       string
	Description string
	CreatedAt   time.Time
	UpdatedAt   time.Time

	Tasks []Task
}

type TaskStatus string

const (
	TaskStatusPending    TaskStatus = "pending"
	TaskStatusInProgress TaskStatus = "in_progress"
	TaskStatusDone       TaskStatus = "done"
)

type Task struct {
	ID          int64
	TodoListID  int64
	Title       string
	Description string
	Status      TaskStatus
	DueDate     *time.Time
	CreatedAt   time.Time
	UpdatedAt   time.Time

	Tags []Tag
}

type Tag struct {
	ID        int64
	UserID    int64
	Name      string
	Color     string
	CreatedAt time.Time
	UpdatedAt time.Time

	Tasks []Task
}
