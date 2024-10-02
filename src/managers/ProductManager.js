import fs from 'fs/promises';

export class ProductManager {
    constructor(filePath) {
        this.path = filePath;
        this.products = [];
        this.idCounter = 1;
        this.loadProducts();
    }

    generateUniqueId() {
        const lastProductId = this.products.length > 0 ? this.products[this.products.length - 1].id : 0;
        
        return lastProductId + 1;
    }

    async loadProducts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');

            if (data.trim() === '') {
                this.products = [];
            } else {
                this.products = JSON.parse(data);
            }
        } catch (error) {
            throw new Error("Error al cargar productos.");
        }
    }

    async saveProducts() {
        try {
            await fs.writeFile(this.path, JSON.stringify(this.products, null, '\t'));
        } catch (error) {
            throw new Error("Error al guardar productos.");
        }
    }

    addProduct({title, description, code, price, status = true, stock, category, thumbnails = []}) {
        price = parseInt(price);
        stock = parseInt(stock);
        
        if (!title || !description || !code || !price || !stock || !category) {
            throw new Error("Todos los campos son obligatorios.");
        }
        
        const isCodeDuplicate = this.products.some(product => product.code === code);

        if (isCodeDuplicate) {
            throw new Error("El codigo del producto ya esta en uso.")
        }

        const id = this.generateUniqueId();

        const newProduct = {
            id,
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails,
        };

        this.products.push(newProduct);
        this.saveProducts();

        return newProduct;
    }

    async getProducts(limit) {
        try {
            if (limit) {
                return this.products.slice(0, limit);
            } else {
                return this.products;
            }
        } catch (error) {
            throw new Error("Error al obtener productos.");
        }
    }

    async getProductById(productId) {
        try {
            const product = this.products.find(product => product.id === parseInt(productId, 10));

            if (!product) {
                throw new Error("Producto no encontrado.");
            }

            return product;
        } catch (error) {
            throw new Error(`Error al obtener el producto con ID ${productId}.`);
        }
    }

    async updateProduct(productId, updatedFields) {
        const productIndex = this.products.findIndex(product => product.id === productId);

        if (productIndex === -1) {
            throw new Error("Producto no encontrado.");
        }

        this.products[productIndex] = { ...this.products[productIndex], ...updatedFields };
        await this.saveProducts();

        return this.products[productIndex];
    }

    async deleteProduct(productId) {
        const initialLength = this.products.length;

        this.products = this.products.filter(product => product.id !== productId);

        if (this.products.length === initialLength) {
            throw new Error("Producto no encontrado.");
        }

        await this.saveProducts();

        const successMessage = "Producto eliminado correctamente";
        
        return successMessage;
    }
}