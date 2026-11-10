# PoC: Arquitectura de Seguridad RBAC con Keycloak, Spring Boot y Angular

Esta Prueba de Concepto (PoC) demuestra la implementación de una arquitectura decoupling moderna con control de acceso basado en roles (**RBAC** - *Role-Based Access Control*). La solución asegura la comunicación entre un **Frontend en Angular**, un **Resource Server en Spring Boot** y un **Identity Provider (IdP) centralizado en Keycloak**.

---

## 📋 Arquitectura del Sistema

```text
[ Angular (Frontend) ] ── (OAuth2 / OIDC) ──> [ Keycloak (Identity Provider) ]
         │                                                   │
         │ (Bearer Token - JWT)                              │ (Validación de Tokens/Realm)
         ▼                                                   ▼
[ Spring Boot (Resource Server) ] <──────────────────────────┘
```

| Componente | Tecnología / Framework | Puerto Local | Función Principal |
| :--- | :--- | :--- | :--- |
| **Identity Provider** | Keycloak 24+ | `http://localhost:8080` | Gestión de usuarios, autenticación y emisión de tokens JWT. |
| **Resource Server** | Spring Boot 3.x + Spring Security | `http://localhost:8082` | Backend de servicios protegidos mediante filtros OAuth2 / Resource Server. |
| **Frontend** | Angular 18+ & PrimeNG | `http://localhost:4200` | Interfaz de usuario SPA integrada con `keycloak-angular`. |

---

## 🔐 Configuración de Roles y Usuarios (Keycloak)

El Realm de autenticación configurado (`poc-realm`) cuenta con las siguientes credenciales de prueba:

| Usuario | Contraseña | Roles Asignados | Accesos Permitidos |
| :--- | :--- | :--- | :--- |
| `usuario_user` | `123` | `ROLE_USER` | Acceso a `/api/user`. Bloqueado en `/api/admin` (HTTP 403). |
| `usuario_admin` | `123` | `ROLE_ADMIN`, `ROLE_USER` | Acceso a `/api/user` y `/api/admin` (HTTP 200). |

---

## 🚀 Guía de Despliegue y Ejecución Local

### Pre-requisitos
* **Java JDK 17+**
* **Node.js (v18+)** y **npm**
* **Keycloak** corriendo localmente en el puerto `8080`

---

### 1. Servidor de Identidad (Keycloak)
1. Iniciar Keycloak en el puerto `8080`.
2. Crear/Importar el Realm `poc-realm`.
3. Crear el cliente público: `frontend-angular`.
   * **Valid Redirect URIs:** `http://localhost:4200/*`
   * **Web Origins:** `http://localhost:4200`

---

### 2. Backend (Spring Boot Resource Server)
1. Navegar a la carpeta del backend:
   ```bash
   cd demo
   ```
2. Compilar y ejecutar la aplicación (puerto `8082`):
   ```bash
   ./mvnw spring-boot:run
   ```

#### Endpoints Expuestos:
* **`GET /api/user`**: Protegido. Requiere cualquier token válido con rol `ROLE_USER`.
* **`GET /api/admin`**: Protegido. Requiere token con rol `ROLE_ADMIN`.

---

### 3. Frontend (Angular + PrimeNG)
1. Navegar a la carpeta del frontend:
   ```bash
   cd frontend-angular
   ```
2. Instalar las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Iniciar el servidor de desarrollo:
   ```bash
   npx ng serve --open
   ```
4. La aplicación abrirá automáticamente en `http://localhost:4200`.

---

## ⚙️ Flujo de Funcionamiento Técnico

1. **Autenticación (OIDC):** Al ingresar a la SPA de Angular, el interceptor de Keycloak detecta si el usuario está autenticado. Si no hay sesión activa, redirige automáticamente a la pantalla de login corporativa de Keycloak (`localhost:8080`).
2. **Emisión de Token JWT:** Keycloak valida las credenciales y devuelve un token firmado conteniendo los atributos del perfil y el arreglo de roles en `realm_access.roles`.
3. **Propagación del Token (Interceptor HTTP):** Cada petición realizada desde Angular hacia la API REST (`localhost:8082`) adjunta automáticamente el token en el encabezado HTTP:
   ```http
   Authorization: Bearer <eyJhbGciOiJSUzI1Ni...token_jwt...>
   ```
4. **Autorización en Backend (Spring Security):** Spring Boot intercepta la solicitud, decodifica y verifica la firma del JWT contra la llave pública de Keycloak, extrae los roles y concede o deniega el acceso según las reglas configuradas en `SecurityConfig.java`:
   - HTTP 200 OK: Si el usuario posee el rol requerido.
   - HTTP 403 Forbidden: Si el rol es insuficiente.