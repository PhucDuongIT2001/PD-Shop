package com.example.demo.model;

public class Product {
    private Long id;
    private String name;
    private Double price;
    private String image;
    private Category categories;
    private Brand brand;

    public Product(long id, String name, Double price, String image, Category categories, Brand brand) {

        this.id = id;
        this.name = name;
        this.price = price;
        this.image = image;
        this.categories = categories;
        this.brand = brand;
    }
    // Getter
   public long getId() {return id;}
    public String getName() {return name;}
    public Double getPrice() {return price;}
    public String getImage() {return image;}
    public Category getCategories() {return categories;}
    public Brand getBrand() {return brand;}
}
