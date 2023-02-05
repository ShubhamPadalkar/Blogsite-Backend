const express = require('express')
const CORS = require('cors')
const dotenv = require('dotenv')
dotenv.config()
const dbconnect = require('./config/db/dbConnect')
const userrouter = require('./route/users/userRoutes')
const { errorHandler,notFound } = require('./middlewares/error/errorHandler')
const postRoute = require('./route/posts/postRoute')
const commentRouter = require('./route/comments/commentRoute')
const emailMsgRouter = require('./route/emailMsg/emailMsgRoute')
const categoryRouter = require('./route/category/CategoryRouter')



const app = express()
app.use(CORS())
const PORT = process.env.PORT 
app.use(express.json())
//DB
dbconnect()
//User route
app.use('/api/users',userrouter)
//Post route
app.use('/api/posts',postRoute)
app.use('/api/comments',commentRouter)
app.use('/api/email',emailMsgRouter)
app.use('/api/category',categoryRouter)

app.use(notFound)
app.use(errorHandler)




app.listen(PORT,console.log(`server is running on ${PORT}`))