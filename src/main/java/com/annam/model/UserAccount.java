package com.annam.model;

/**
 * User account representing an authenticated user with a specific role.
 */
public class UserAccount {
    private String id;
    private String username;
    private String fullName;
    private String email;
    private UserRole role;
    private String associatedEntityId; // donorId, recipientId, or adminId

    public UserAccount(String id, String username, String fullName, String email, UserRole role, String associatedEntityId) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.associatedEntityId = associatedEntityId;
    }

    public String getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public UserRole getRole() {
        return role;
    }

    public String getAssociatedEntityId() {
        return associatedEntityId;
    }

    @Override
    public String toString() {
        return String.format("[%s] %s (%s) - %s", role, fullName, username, email);
    }
}
