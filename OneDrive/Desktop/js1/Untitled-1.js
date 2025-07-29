const http=require('http');
const server=http.createServer((req,res)=>{
    console.log(req);
    process.exit();
})
const port=2890;
server.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})