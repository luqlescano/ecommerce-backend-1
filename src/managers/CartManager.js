import fs from 'fs/promises';
import { ProductManager } from './ProductManager.js';
import config from '../config.js';
import path from 'path';

export class CartManager {
    constructor(filePath) {
        this.path = filePath;
        this.carts = [];
        this.idCounter = 1;
        this.loadCarts();
    }

    generateUniqueId() {
        const lastCartId = this.carts.length > 0 ? this.carts[this.carts.length - 1].id : 0;
        
        return lastCartId + 1;
    }

    async loadCarts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');

            if (data.trim() === '') {
                this.carts = [];
            } else {
                this.carts = JSON.parse(data);
            }
        } catch (error) {
            throw new Error("Error al cargar carritos.");
        }
    }

    async saveCarts() {
        try {
            await fs.writeFile(this.path, JSON.stringify(this.carts, null, '\t'));
        } catch (error) {
            throw new Error("Error al guardar carritos.");
        }
    }

    createCart(products = []) {
        const newCart = {
            id: this.generateUniqueId(),
            products: [...products],
        };

        this.carts.push(newCart);
        this.saveCarts();

        return newCart;
    }

    async getCartById(cartId) {
        try {
            const cart = this.carts.find(cart => cart.id === parseInt(cartId, 10));

            if (!cart) {
                throw new Error("Carrito no encontrado.");
            }

            return cart;
        } catch (error) {
            throw new Error(`Error al obtener el carrito con ID ${cartId}.`);
        }
    }

    async addProductToCart(cartId, productId, quantity) {
        const cartIndex = this.carts.findIndex(cart => cart.id === parseInt(cartId, 10));

        if (cartIndex === -1) {
            throw new Error("Carrito no encontrado.");
        }

        const productFilePath = path.join(config.DIRNAME, 'utils', 'products.json');
        const productManager = new ProductManager(productFilePath);
        await productManager.loadProducts();

        const product = await productManager.getProductById(productId);

        if (!product) {
            throw new Error("Producto no encontrado.");
        }

        const productInCartIndex = this.carts[cartIndex].products.findIndex(product => product.id === parseInt(productId, 10));

        if (productInCartIndex === -1) {
            this.carts[cartIndex].products.push({ id: parseInt(productId,10), quantity });
        } else {
            this.carts[cartIndex].products[productInCartIndex].quantity += quantity;
        }

        await this.saveCarts();

        return this.carts[cartIndex];
    }
}