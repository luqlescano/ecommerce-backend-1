import { Router } from 'express';
import { ProductManager } from '../managers/ProductManager.js';
import config from '../config.js';
import path from 'path';

const router = Router();
const productFilePath = path.join(config.DIRNAME, 'utils', 'products.json');
const productManager = new ProductManager(productFilePath);

router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.status(200).render('home', { products });
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).send('Error al obtener los productos.');
    }
});

export default router;