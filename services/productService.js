import FishProduct from '../models/FishProduct.js';
import {
  validatePagination,
  validateFishCategory,
  validatePrice,
  validateStock,
  validateProductName,
  validateImages
} from '../utils/helpers/validationHelper.js';
import {
  FISH_CATEGORIES,
  PAGINATION,
  SUCCESS_MESSAGES,
  RESOURCE_ERRORS
} from '../constants/index.js';

export const getAllProductsService = async (filters = {}) => {
  try {
    const { page, limit, skip } = validatePagination(filters.page, filters.limit);

    const queryFilter = {};

    if (filters.category && Object.values(FISH_CATEGORIES).includes(filters.category)) {
      queryFilter.category = filters.category;
    }

    if (filters.isAvailable !== undefined) {
      queryFilter.isAvailable = filters.isAvailable === 'true';
    }

    if (filters.minPrice || filters.maxPrice) {
      queryFilter.price = {};
      if (filters.minPrice) {
        const minPriceValidation = validatePrice(filters.minPrice);
        if (minPriceValidation.isValid) {
          queryFilter.price.$gte = minPriceValidation.value;
        }
      }
      if (filters.maxPrice) {
        const maxPriceValidation = validatePrice(filters.maxPrice);
        if (maxPriceValidation.isValid) {
          queryFilter.price.$lte = maxPriceValidation.value;
        }
      }
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      queryFilter.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    const products = await FishProduct.find(queryFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalProducts = await FishProduct.countDocuments(queryFilter);
    const totalPages = Math.ceil(totalProducts / limit);

    const pagination = {
      currentPage: page,
      totalPages,
      totalProducts,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit
    };

    const stats = await FishProduct.aggregate([
      { $match: queryFilter },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          availableProducts: { $sum: { $cond: ['$isAvailable', 1, 0] } },
          totalStock: { $sum: '$stock' },
          averagePrice: { $avg: '$price' }
        }
      }
    ]);

    const productStats = stats[0] || {
      totalProducts: 0,
      availableProducts: 0,
      totalStock: 0,
      averagePrice: 0
    };

    return {
      success: true,
      products,
      pagination,
      stats: {
        ...productStats,
        averagePrice: Math.round(productStats.averagePrice * 100) / 100
      }
    };
  } catch (error) {
    console.error('Get all products service error:', error);
    throw new Error('Failed to retrieve products');
  }
};

export const getProductByIdService = async (productId) => {
  try {
    const product = await FishProduct.findById(productId).lean();

    if (!product) {
      throw new Error(RESOURCE_ERRORS.PRODUCT_NOT_FOUND);
    }

    return {
      success: true,
      product
    };
  } catch (error) {
    console.error('Get product by ID service error:', error);
    throw error;
  }
};

export const createProductService = async (productData, adminEmail) => {
  try {
    const nameValidation = validateProductName(productData.name);
    if (!nameValidation.isValid) {
      throw new Error(nameValidation.message);
    }

    const categoryValidation = validateFishCategory(productData.category);
    if (!categoryValidation.isValid) {
      throw new Error(categoryValidation.message);
    }

    const priceValidation = validatePrice(productData.price);
    if (!priceValidation.isValid) {
      throw new Error(priceValidation.message);
    }

    const stockValidation = validateStock(productData.stock);
    if (!stockValidation.isValid) {
      throw new Error(stockValidation.message);
    }

    const imagesValidation = validateImages(productData.images);
    if (!imagesValidation.isValid) {
      throw new Error(imagesValidation.message);
    }

    const existingProduct = await FishProduct.findOne({
      name: { $regex: `^${nameValidation.value}$`, $options: 'i' },
      category: categoryValidation.value
    });

    if (existingProduct) {
      throw new Error(
        `A product named "${nameValidation.value}" in the "${categoryValidation.value}" category already exists`
      );
    }

    const newProduct = new FishProduct({
      name: nameValidation.value,
      category: categoryValidation.value,
      price: priceValidation.value,
      stock: stockValidation.value,
      description: productData.description ? productData.description.trim() : '',
      images: imagesValidation.value,
      createdBy: adminEmail
    });

    await newProduct.save();

    console.log(`Admin ${adminEmail} created product: ${newProduct.name} (ID: ${newProduct._id})`);

    return {
      success: true,
      message: SUCCESS_MESSAGES.PRODUCT_CREATED,
      product: {
        id: newProduct._id,
        name: newProduct.name,
        category: newProduct.category,
        price: newProduct.price,
        stock: newProduct.stock,
        description: newProduct.description,
        images: newProduct.images,
        createdBy: newProduct.createdBy,
        isAvailable: newProduct.isAvailable,
        createdAt: newProduct.createdAt,
        updatedAt: newProduct.updatedAt
      }
    };
  } catch (error) {
    console.error('Create product service error:', error);
    throw error;
  }
};

export const updateProductService = async (productId, updateData, adminEmail) => {
  try {
    const product = await FishProduct.findById(productId);

    if (!product) {
      throw new Error(RESOURCE_ERRORS.PRODUCT_NOT_FOUND);
    }

    const updatedFields = {};

    if (updateData.name !== undefined) {
      const nameValidation = validateProductName(updateData.name);
      if (!nameValidation.isValid) {
        throw new Error(nameValidation.message);
      }
      updatedFields.name = nameValidation.value;
    }

    if (updateData.category !== undefined) {
      const categoryValidation = validateFishCategory(updateData.category);
      if (!categoryValidation.isValid) {
        throw new Error(categoryValidation.message);
      }
      updatedFields.category = categoryValidation.value;
    }

    if (updateData.price !== undefined) {
      const priceValidation = validatePrice(updateData.price);
      if (!priceValidation.isValid) {
        throw new Error(priceValidation.message);
      }
      updatedFields.price = priceValidation.value;
    }

    if (updateData.stock !== undefined) {
      const stockValidation = validateStock(updateData.stock);
      if (!stockValidation.isValid) {
        throw new Error(stockValidation.message);
      }
      updatedFields.stock = stockValidation.value;
    }

    if (updateData.description !== undefined) {
      updatedFields.description = updateData.description.trim();
    }

    if (updateData.images !== undefined) {
      const imagesValidation = validateImages(updateData.images);
      if (!imagesValidation.isValid) {
        throw new Error(imagesValidation.message);
      }
      updatedFields.images = imagesValidation.value;
    }

    if (updateData.isAvailable !== undefined) {
      updatedFields.isAvailable = Boolean(updateData.isAvailable);
    }

    if (updatedFields.name || updatedFields.category) {
      const nameToCheck = updatedFields.name || product.name;
      const categoryToCheck = updatedFields.category || product.category;

      const duplicateProduct = await FishProduct.findOne({
        _id: { $ne: productId },
        name: { $regex: `^${nameToCheck}$`, $options: 'i' },
        category: categoryToCheck
      });

      if (duplicateProduct) {
        throw new Error(
          `A product named "${nameToCheck}" in the "${categoryToCheck}" category already exists`
        );
      }
    }

    const updatedProduct = await FishProduct.findByIdAndUpdate(productId, updatedFields, {
      new: true,
      runValidators: true
    }).lean();

    console.log(
      `Admin ${adminEmail} updated product ${updatedProduct.name} (ID: ${productId}):`,
      Object.keys(updatedFields)
    );

    return {
      success: true,
      message: SUCCESS_MESSAGES.PRODUCT_UPDATED,
      product: updatedProduct
    };
  } catch (error) {
    console.error('Update product service error:', error);
    throw error;
  }
};

export const deleteProductService = async (productId, adminEmail) => {
  try {
    const product = await FishProduct.findById(productId);

    if (!product) {
      throw new Error(RESOURCE_ERRORS.PRODUCT_NOT_FOUND);
    }

    await FishProduct.findByIdAndDelete(productId);

    console.log(`Admin ${adminEmail} deleted product ${product.name} (ID: ${productId})`);

    return {
      success: true,
      message: SUCCESS_MESSAGES.PRODUCT_DELETED
    };
  } catch (error) {
    console.error('Delete product service error:', error);
    throw error;
  }
};

export const toggleProductAvailabilityService = async (productId, adminEmail) => {
  try {
    const product = await FishProduct.findById(productId);

    if (!product) {
      throw new Error(RESOURCE_ERRORS.PRODUCT_NOT_FOUND);
    }

    product.isAvailable = !product.isAvailable;
    await product.save();

    console.log(
      `Admin ${adminEmail} ${product.isAvailable ? 'enabled' : 'disabled'} product ${product.name} (ID: ${productId})`
    );

    return {
      success: true,
      message: `Product ${product.isAvailable ? 'enabled' : 'disabled'} successfully`,
      product: {
        id: product._id,
        name: product.name,
        isAvailable: product.isAvailable
      }
    };
  } catch (error) {
    console.error('Toggle product availability service error:', error);
    throw error;
  }
};
