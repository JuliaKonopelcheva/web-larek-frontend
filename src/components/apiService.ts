import { Api } from './base/api';
import { IApiService, Product, ProductListResponse, OrderRequest, OrderResponse } from '../types';
import { ApiListResponse } from './base/api';

export class ApiService extends Api implements IApiService {
    private readonly cdn: string;

    constructor(cdn: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options);
        this.cdn = cdn;
    }

	getProducts(): Promise<ApiListResponse<Product>> {
		return this.get('/product').then((data: ApiListResponse<Product>) => ({
			total: data.total,
			items: data.items.map(item => ({
				...item,
				image: this.cdn + item.image.replace(".svg", ".png"),
			}))
		}));
	}

    getProductById(id: string): Promise<Product> {
		return this.get(`/product/${id}`).then((item: Product) => ({
			...item,
			image: this.cdn + item.image,
		}));
    };

    submitOrder(data: OrderRequest): Promise<OrderResponse> {
        return this.post('/order', data).then((data: OrderResponse) => data);
    };
}

