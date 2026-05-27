package com.example.demo.dto.ar;

public class ArHotspotDto {
    private Long id;
    private String name;
    private String position;
    private String normal;
    private String labelText;

    public ArHotspotDto() {}

    public ArHotspotDto(Long id, String name, String position, String normal, String labelText) {
        this.id = id;
        this.name = name;
        this.position = position;
        this.normal = normal;
        this.labelText = labelText;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public String getNormal() { return normal; }
    public void setNormal(String normal) { this.normal = normal; }

    public String getLabelText() { return labelText; }
    public void setLabelText(String labelText) { this.labelText = labelText; }
}
