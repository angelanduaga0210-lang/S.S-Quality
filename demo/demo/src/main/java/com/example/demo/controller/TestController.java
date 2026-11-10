package com.example.demo.controller;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200") // <- Habilita la comunicación con Angular
public class TestController {

    @GetMapping("/user")
    public Map<String, String> getUser() {
        return Map.of("message", "Endpoint protegido: Acceso concedido a usuario con ROLE_USER");
    }

    @GetMapping("/admin")
    public Map<String, String> getAdmin() {
        return Map.of("message", "Endpoint protegido: Acceso concedido a administrador con ROLE_ADMIN");
    }
}