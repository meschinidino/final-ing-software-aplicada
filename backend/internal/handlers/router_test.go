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

func TestCORSPreflightAllowsLocalWebApp(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := NewRouter(nil, auth.NewService("test-secret", time.Hour))

	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodOptions, "/api/todo-lists", nil)
	request.Header.Set("Origin", "http://localhost:5173")
	request.Header.Set("Access-Control-Request-Method", "GET")

	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusNoContent {
		t.Fatalf("OPTIONS /api/todo-lists status = %d, want %d", recorder.Code, http.StatusNoContent)
	}
	if got := recorder.Header().Get("Access-Control-Allow-Origin"); got != "http://localhost:5173" {
		t.Fatalf("Access-Control-Allow-Origin = %q, want localhost Vite origin", got)
	}
}
