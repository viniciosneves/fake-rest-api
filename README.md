# JSONServer + JWT Auth

Uma API Rest mockada, utilizando json-server e JWT.


End-points implementados: login,register,gerentes

## Instalação

```bash
$ npm install
$ npm run start-auth
```

Talvez seja necessário:
```
npm audit fix
```

## Como fazer login/registrar-se?


Você pode fazer isso efetuando uma requisição post para:

```
POST http://localhost:8000/auth/login
POST http://localhost:8000/auth/register
```

Com os seguintes dados:


```
{
  "email": "vinicios@alura.com.br",
  "senha":"123456"
}
```

Você vai receber um token no seguinte formato:

```
{
   "access_token": "<ACCESS_TOKEN>"
}
```


E então, adicionar este mesmo token ao header das próximas requisições:

```
Authorization: Bearer <ACCESS_TOKEN>
```
