package router

import (
	"ibuy-server/middleware"
	"net/http"
)

type MiddlewareMux struct {
	mux *http.ServeMux
	middlewares []middleware.Middleware
}

func NewMiddlewareMux(mw ...middleware.Middleware) *MiddlewareMux{
	return &MiddlewareMux{
		mux: http.NewServeMux(),
		middlewares: mw,
	}
}

func (m * MiddlewareMux) Handle(path string, handler http.HandlerFunc, extra ...middleware.Middleware){
	all := append(m.middlewares, extra...)
	m.mux.HandleFunc(path, middleware.Chain(handler, all...))
}

func (m *MiddlewareMux) ServeHTTP(w http.ResponseWriter, r *http.Request){
	m.mux.ServeHTTP(w, r)
}