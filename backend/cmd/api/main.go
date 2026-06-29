package main

import (
	"log"

	"todolist/backend/internal/auth"
	"todolist/backend/internal/config"
	"todolist/backend/internal/database"
	"todolist/backend/internal/handlers"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("load config: %v", err)
	}

	db, err := database.Open(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("connect database: %v", err)
	}

	authService := auth.NewService(cfg.JWTSecret, cfg.TokenTTL)
	router := handlers.NewRouter(db, authService)

	log.Printf("starting api on %s", cfg.Addr)
	if err := router.Run(cfg.Addr); err != nil {
		log.Fatalf("run api: %v", err)
	}
}
