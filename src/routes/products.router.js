import { Router } from 'express';
import { ProductManager } from '../managers/ProductManager.js';
import config from '../config.js';
import path from 'path';

const router = Router();
const productFilePath = path.join(config.DIRNAME, 'utils', 'products.json');
const productManager = new ProductManager(productFilePath);

router.get('/', async (req, res) => {
    try {
        const limit = req.query.limit;
        const products = await productManager.getProducts(limit);
        res.status(200).json({ error: null, data: products });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const product = await productManager.getProductById(productId);
        res.status(200).json({ error: null, data: product });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const newProduct = await productManager.addProduct(req.body);
        res.status(200).json({ error: null, data: newProduct });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid, 10);
        const updateProduct = await productManager.updateProduct(productId, req.body);
        res.status(200).json({ error: null, data: updateProduct});
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

router.delete('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid, 10);
        const successMessage = await productManager.deleteProduct(productId);
        res.status(200).json({ error: null, data: successMessage });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

export default router;