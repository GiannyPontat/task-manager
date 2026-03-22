package com.taskmanager.mapper;

import com.taskmanager.dto.ActivityResponse;
import com.taskmanager.entity.Activity;
import org.springframework.stereotype.Component;

@Component
public class ActivityMapper {

    public ActivityResponse toResponse(Activity activity) {
        ActivityResponse r = new ActivityResponse();
        r.setId(activity.getId());
        r.setAuthorName(activity.getUser().getUsername());
        r.setAuthorInitials(initials(activity.getUser().getUsername()));
        r.setType(activity.getType());
        r.setDetail(activity.getDetail());
        r.setCreatedAt(activity.getCreatedAt());
        return r;
    }

    private String initials(String name) {
        if (name == null || name.isBlank()) return "?";
        String[] parts = name.trim().split("\\s+");
        if (parts.length >= 2) {
            return ("" + parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
        }
        return name.substring(0, Math.min(2, name.length())).toUpperCase();
    }
}
