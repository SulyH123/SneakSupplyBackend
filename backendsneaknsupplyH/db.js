const mongoose=require('mongoose');
// const uri='mongodb+srv://moiz:m/oiz@digitalmediabay.qxecphq.mongodb.net/?retryWrites=true&w=majority';
const uri='mongodb+srv://sulaymanhussain:sulayman@cluster0.mhnfjzb.mongodb.net/?retryWrites=true&w=majority';
const connecttomongo=()=>
{
    mongoose.connect(uri).then((data)=>{
        console.log('Connected to databse successfully '+ data.Connection.name)
    }).catch((err)=>{
        console.log(err);
    })
};
module.exports=connecttomongo;
