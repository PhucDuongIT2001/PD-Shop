package com.example.demo.repository;

import com.example.demo.entity.ArHotspot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArHotspotRepository extends JpaRepository<ArHotspot, Long> {
    List<ArHotspot> findByArAssetId(Long arAssetId);
}
