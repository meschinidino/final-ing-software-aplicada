FROM golang:1.25-alpine AS builder

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/todolist-api ./cmd/api

FROM alpine:3.22

RUN addgroup -S app && adduser -S app -G app && apk add --no-cache ca-certificates wget

USER app
WORKDIR /app

COPY --from=builder /out/todolist-api /app/todolist-api

EXPOSE 8080

CMD ["/app/todolist-api"]
