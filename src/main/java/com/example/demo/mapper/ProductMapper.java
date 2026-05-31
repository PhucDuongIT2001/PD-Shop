package com.example.demo.mapper;

import com.example.demo.dto.ProductDto;
import com.example.demo.entity.Product;
import com.example.demo.entity.enums.ProductStatus;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(source = "category.name",   target = "categoryName")
    @Mapping(source = "category.id",     target = "categoryId")
    @Mapping(source = "brand.id",        target = "brandId")
    @Mapping(source = "brand.name",      target = "brandName")
    @Mapping(source = "status",          target = "status", qualifiedByName = "statusToString")
    // Fix: Product.quantity → ProductDto.stockQuantity (field names differ)
    @Mapping(source = "quantity",        target = "stockQuantity")
    // Map all previously missing fields
    @Mapping(source = "basePrice",       target = "basePrice")
    @Mapping(source = "soldQuantity",    target = "soldQuantity")
    @Mapping(source = "shortDescription",target = "shortDescription")
    @Mapping(source = "warrantyPeriod",  target = "warrantyPeriod")
    @Mapping(source = "isNew",           target = "isNew")
    @Mapping(source = "sku",             target = "sku")
    @Mapping(source = "fullSpecifications", target = "fullSpecifications")
    ProductDto toProductDto(Product product);

    // For creating/updating product from DTO
    @Mapping(target = "id",         ignore = true)
    @Mapping(target = "category",   ignore = true)
    @Mapping(target = "brand",      ignore = true)
    @Mapping(target = "createdAt",  ignore = true)
    @Mapping(target = "updatedAt",  ignore = true)
    @Mapping(target = "deleted",    ignore = true)
    @Mapping(target = "variants",   ignore = true)
    @Mapping(target = "version",    ignore = true)
    @Mapping(source = "status",     target = "status", qualifiedByName = "stringToStatus")
    // Fix reverse: ProductDto.stockQuantity → Product.quantity
    @Mapping(source = "stockQuantity", target = "quantity")
    Product toProduct(ProductDto productDto);

    @Named("statusToString")
    default String statusToString(ProductStatus status) {
        return status != null ? status.name() : null;
    }

    @Named("stringToStatus")
    default ProductStatus stringToStatus(String status) {
        try {
            return status != null ? ProductStatus.valueOf(status) : null;
        } catch (IllegalArgumentException e) {
            return ProductStatus.ACTIVE;
        }
    }
}
