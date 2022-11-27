const fs = require("fs")

const bodyParser = require("body-parser")

const jsonserver = require("json-server")

const jwt = require("jsonwebtoken")

const server = jsonserver.create();

const userDb = JSON.parse(fs.readFileSync("./users.json","utf-8"))

server.use(bodyParser.urlencoded({extended:true}))

server.use(bodyParser.json())

server.use(jsonserver.defaults())

const SECRET_KEY = "799220"

const expiresIn = "1h"


function createToken(payload){
    return jwt.sign(payload,SECRET_KEY,{expiresIn});
}

function isAuthenticated({email,password}){
  const userDb1 = JSON.parse(fs.readFileSync("./users.json","utf-8"))
    return (
        userDb1.users.findIndex((user)=>user.email===email && user.password === password) !==-1
    )
}

server.post("/api/auth/register",(req,res) => {
    const {email, password} = req.body

    if(isAuthenticated({email,password})){
        const status = 401;

        const message = "Email already exists"

        res.status(status).json({status,message})
        return;
    }

    fs.readFile("./users.json", (err,data)=>{
        if(err){
            const status = 401;

            const message = err;

            res.status(status).json({status,message})
            return;
        }

        data = JSON.parse(data.toString());

        const uniqid = require('uniqid')

        let last_item_id = uniqid()

        data.users.push({id:last_item_id,email:email,password:password})

        let writeData = fs.writeFile("./users.json", JSON.stringify(data),
        (err,result) => {
            if(err){
                const status = 401;

                const message = err;

                res.status(status).json({status,message})
                return;
            }
        });
    })

    const access_token = createToken({email,password})

    res.status(200).json(access_token)
});

server.post("/api/auth/login",(req,res)=>{
    const {email,password} = req.body

    if(isAuthenticated({email,password})){
        const status = 401;

        const message = "Incorrect Email or password"

        res.status(status).json({status,message})
        return;
    }
})

server.listen(8080,()=>{
    console.log("listening")
})
