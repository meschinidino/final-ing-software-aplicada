package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"todolist/backend/internal/auth"
)

const UserIDKey = "userID"

func RequireAuth(authService auth.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if !strings.HasPrefix(header, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing bearer token"})
			return
		}

		claims, err := authService.ValidateToken(strings.TrimSpace(strings.TrimPrefix(header, "Bearer ")))
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		c.Set(UserIDKey, claims.UserID)
		c.Next()
	}
}

func CurrentUserID(c *gin.Context) int64 {
	value, ok := c.Get(UserIDKey)
	if !ok {
		return 0
	}
	userID, ok := value.(int64)
	if !ok {
		return 0
	}
	return userID
}
