package handlers

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"todolist/backend/internal/auth"
)

func TestHealthEndpoint(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := NewRouter(nil, auth.NewService("test-secret", time.Hour))

	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/health", nil)

	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("GET /health status = %d, want %d", recorder.Code, http.StatusOK)
	}
}

func TestProtectedEndpointRejectsMissingBearerToken(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := NewRouter(nil, auth.NewService("test-secret", time.Hour))

	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/api/todo-lists", nil)

	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("GET /api/todo-lists status = %d, want %d", recorder.Code, http.StatusUnauthorized)
	}
}
