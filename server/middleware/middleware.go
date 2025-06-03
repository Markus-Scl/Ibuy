package middleware

import (
	"log"
	"net/http"
	"time"
)

type Middleware func(http.HandlerFunc) http.HandlerFunc

func Logging() Middleware {
	return func(next http.HandlerFunc) http.HandlerFunc{
		return func(w http.ResponseWriter, r *http.Request){
			start := time.Now()
			defer func(){
				log.Printf("%s %s [%s]", r.Method, r.URL.Path, time.Since(start))
			}()

			next(w, r)
		}
	}
}

func Method(method string) Middleware {
	return func(next http.HandlerFunc) http.HandlerFunc{
		return func(w http.ResponseWriter, r *http.Request){
			if r.Method != method{
				http.Error(w, "Bad Request", http.StatusBadRequest)
				return
			}
			next(w, r)
		}
	}
}

func Chain (h http.HandlerFunc, middlewares ...Middleware) http.HandlerFunc{
	for i := len(middlewares) -1; i >= 0; i--{
		h = middlewares[i](h)
	}
	return h
}