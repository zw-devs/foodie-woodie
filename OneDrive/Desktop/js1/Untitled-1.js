const http=require('http');
const server=http.createServer((req,res)=>{
    if(req.url==='/'){
        res.writeHead(200,{'Content-Type':'text/plain'});
        res.end("Sucesfully landed on main page");
    }
    else if(req.url==='/about'){
        res.writeHead(200,{'Content-Type':'text/plain'});
        res.end("Welcome to our about section");
    }
    else if(req.url==='/products' || req.url==='/product'){
        res.writeHead(200,{'Content-Type':'text/plain'});
        res.end("Here is our product section");
    }
    else{
        res.writeHead(404,{'Content-Type':'text/plain'});
        res.end("Landed on wrong page")
    }
})
const port=2890;
server.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})