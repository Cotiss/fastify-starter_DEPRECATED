import { expose, Service } from '../../core/service';
import { Listing } from './listings.models';

export class ListingsService extends Service {
  public serviceName = 'ListingsService';

  async pageListings(limit: number, offset: number) {
    const [count, items] = await Promise.all([
      Listing.countDocuments(),
      Listing.find().sort({ createdAt: 1 }).skip(offset).limit(limit).lean(),
    ]);
    return {
      items,
      count,
    }
  }
}

export default expose(ListingsService);
