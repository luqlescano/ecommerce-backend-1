import { Router } from 'express';
import { CartManager } from '../managers/CartManager.js';
import config from '../config.js';
import path from 'path';

const router = Router();
const cartFilePath = path.join(config.DIRNAME, 'utils', 'carts.json');
const cartManager = new CartManager(cartFilePath);

router.post('/', async (req, res) => {
    try {
        const products = req.body.products || [];
        const newCart = await cartManager.createCart(products);
        res.status(200).json({ error: null, data: newCart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await cartManager.getCartById(cartId);
        res.status(200).json({ error: null, data: cart });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = req.body.quantity || 1;
        const updatedCart = await cartManager.addProductToCart(cartId, productId, quantity);
        res.status(200).json({ error: null, data: updatedCart });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }  
});

export default router;