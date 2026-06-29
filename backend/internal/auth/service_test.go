package auth

import (
	"testing"
	"time"
)

func TestCanonicalEmail(t *testing.T) {
	got := CanonicalEmail("  User@Example.COM ")
	if got != "user@example.com" {
		t.Fatalf("CanonicalEmail() = %q, want %q", got, "user@example.com")
	}
}

func TestValidateTokenRejectsExpiredToken(t *testing.T) {
	service := NewService("test-secret", -time.Minute)
	token, _, err := service.IssueToken(42)
	if err != nil {
		t.Fatalf("IssueToken() error = %v", err)
	}

	if _, err := service.ValidateToken(token); err == nil {
		t.Fatal("ValidateToken() accepted an expired token")
	}
}
