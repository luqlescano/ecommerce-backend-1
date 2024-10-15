import express from 'express';
import handlebars from 'express-handlebars';
import fs from 'fs';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import realTimeProductsRouter from './routes/realTimeProducts.router.js';
import { Server } from 'socket.io';
import config from './config.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', handlebars.engine());
app.set('views', `${config.DIRNAME}/views`);
app.set('view engine', 'handlebars');

app.use('/static', express.static(`${config.DIRNAME}/public`));

app.use('/', viewsRouter);
app.use('/realtimeproducts', realTimeProductsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

const httpServer = app.listen(config.PORT, () => {
    console.log(`Servidor activo en http://localhost:${config.PORT}`);
});

const io = new Server(httpServer);

let products = [];

function sendProductList() {
    io.emit('productList', products);
}

fs.readFile(`${config.DIRNAME}/utils/products.json`, 'utf8', (error, data) => {
    if (error) {
        console.error("Error al leer el archivo:", error);
        return;
    }
    products = JSON.parse(data);
    sendProductList();
});

function updateProductListInFile(products) {
    fs.writeFile(`${config.DIRNAME}/utils/products.json`, JSON.stringify(products, null, '\t'), (error) => {
        if (error) {
            console.error("Error al guardar productos en el archivo:", error);
        } else {
            console.log("Productos guardados en el archivo correctamente.");
        }
    });
}

io.on('connection', socket => {
    console.log("Nuevo cliente conectado:", socket.id);

    sendProductList();

    socket.on('addProduct', newProduct => {
        const productId = products.length > 0 ? products[products.length - 1].id + 1 : 1;
        
        newProduct.id = parseInt(productId);
        newProduct.price = parseInt(newProduct.price);
        newProduct.stock = parseInt(newProduct.stock);

        products.push(newProduct);

        updateProductListInFile(products);

        sendProductList();
    });

    socket.on('productClicked', productId => {
        products = products.filter(product => product.id !== productId);

        updateProductListInFile(products);

        sendProductList();
    });

    socket.on('disconnect', () => {
        console.log("Cliente desconectado:", socket.id);
    });
});