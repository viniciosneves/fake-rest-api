const fs = require('fs')
const bodyParser = require('body-parser')
const jsonServer = require('json-server')
const jwt = require('jsonwebtoken')

const server = jsonServer.create()
const router = jsonServer.router('./database.json')
let userdb = JSON.parse(fs.readFileSync('./usuarios.json', 'UTF-8'))

server.use(bodyParser.urlencoded({extended: true}))
server.use(bodyParser.json())
server.use(jsonServer.defaults());

const SECRET_KEY = '123456789'

const expiresIn = '12h'

function createToken(payload){
  return jwt.sign(payload, SECRET_KEY, {expiresIn})
}

function verifyToken(token){
  return  jwt.verify(token, SECRET_KEY, (err, decode) => decode !== undefined ?  decode : err)
}

function isAuthenticated({email, senha}){
  return userdb.usuarios.findIndex(user => user.email === email && user.senha === senha) !== -1
}

server.post('/auth/register', (req, res) => {
  console.log(req.body);
  const {email, senha, nome} = req.body;

  if(isAuthenticated({email, senha}) === true) {
    const status = 401;
    const message = 'E-mail já foi utilizado!';
    res.status(status).json({status, message});
    return
  }

fs.readFile("./usuarios.json", (err, data) => {  
    if (err) {
      const status = 401
      const message = err
      res.status(status).json({status, message})
      return
    };

    var data = JSON.parse(data.toString());

    var last_item_id = data.usuarios.length > 0 ? data.usuarios[data.usuarios.length-1].id : 0;

    data.usuarios.push({id: last_item_id + 1, email, senha, nome});
    var writeData = fs.writeFile("./usuarios.json", JSON.stringify(data), (err, result) => {
        if (err) {
          const status = 401
          const message = err
          res.status(status).json({status, message})
          return
        }
    });
    userdb = data
});

  const access_token = createToken({email, senha})
  console.log("Access Token:" + access_token);
  res.status(200).json({access_token})
})

server.post('/auth/login', (req, res) => {
  console.log("login endpoint called; request body:");
  console.log(req.body);
  const {email, senha} = req.body;
  if (isAuthenticated({email, senha}) === false) {
    const status = 401
    const message = 'E-mail ou senha incorretos!'
    res.status(status).json({status, message})
    return
  }
  const access_token = createToken({email, senha})
  let user = { ...userdb.usuarios.find(user => user.email === email && user.senha === senha) }
  delete user.senha
  console.log("Access Token:" + access_token);
  console.log("User:" + user);
  res.status(200).json({access_token, user})
})

server.use(/^(?!\/auth).*$/,  (req, res, next) => {
  if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
    const status = 401
    const message = 'Token inválido'
    res.status(status).json({status, message})
    return
  }
  try {
    let verifyTokenResult;
     verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

     if (verifyTokenResult instanceof Error) {
       const status = 401
       const message = 'Token de autenticação não encontrado'
       res.status(status).json({status, message})
       return
     }
     next()
  } catch (err) {
    const status = 401
    const message = 'Token revogado'
    res.status(status).json({status, message})
  }
})

server.use(router)

server.listen(8000, () => {
  console.log('ouvindo na porta 8000...')
})