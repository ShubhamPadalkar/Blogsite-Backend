const mongoose = require('mongoose')

const dbconnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_ATLAS,{
            
        });
        console.log('Database is connected')
    }
    catch(error){
        console.log(error)
    }
}

module.exports = dbconnect