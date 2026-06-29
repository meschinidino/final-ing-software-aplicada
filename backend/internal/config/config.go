package config

import (
	"errors"
	"os"
	"strconv"
	"time"
)

type Config struct {
	Addr        string
	DatabaseURL string
	JWTSecret   string
	TokenTTL    time.Duration
}

func Load() (Config, error) {
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		if os.Getenv("APP_ENV") != "development" {
			return Config{}, errors.New("JWT_SECRET is required unless APP_ENV=development")
		}
		jwtSecret = "local-development-secret"
	}

	return Config{
		Addr:        getEnv("API_ADDR", ":8080"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/todolist?sslmode=disable"),
		JWTSecret:   jwtSecret,
		TokenTTL:    time.Duration(getEnvInt("JWT_TTL_MINUTES", 60)) * time.Minute,
	}, nil
}

func getEnv(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}

func getEnvInt(key string, fallback int) int {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil || parsed <= 0 {
		return fallback
	}
	return parsed
}
