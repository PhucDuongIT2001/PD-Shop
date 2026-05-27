package com.example.demo.mapper;

import com.example.demo.dto.admin.CustomerDetailDTO;
import com.example.demo.entity.Order;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface AdminCustomerMapper {

    @Mapping(source = "user.profile.fullName", target = "fullName")
    @Mapping(source = "user.profile.phone", target = "phone")
    @Mapping(source = "user.profile.address", target = "address")
    @Mapping(source = "user.profile.avatarUrl", target = "avatarUrl")
    @Mapping(source = "user.roles", target = "roles", qualifiedByName = "mapRoles")
    @Mapping(source = "user.orders", target = "orderCount", qualifiedByName = "mapOrderCount")
    @Mapping(source = "user.orders", target = "totalSpent", qualifiedByName = "mapTotalSpent")
    @Mapping(source = "recentOrders", target = "recentOrders")
    CustomerDetailDTO toCustomerDetailDTO(User user, List<Order> recentOrders);

    @Named("mapRoles")
    default Set<String> mapRoles(Set<Role> roles) {
        if (roles == null) return Set.of();
        return roles.stream().map(Role::getName).collect(Collectors.toSet());
    }

    @Named("mapOrderCount")
    default int mapOrderCount(List<Order> orders) {
        return orders == null ? 0 : orders.size();
    }

    @Named("mapTotalSpent")
    default double mapTotalSpent(List<Order> orders) {
        if (orders == null) return 0.0;
        return orders.stream().mapToDouble(Order::getTotalAmount).sum();
    }
}
