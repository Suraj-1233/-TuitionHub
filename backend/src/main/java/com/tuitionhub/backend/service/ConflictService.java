package com.tuitionhub.backend.service;

import com.tuitionhub.backend.model.Batch;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;

@Service
public class ConflictService {

    public String checkConflicts(String requestedTime, List<Batch> batches) {
        if (requestedTime == null || !requestedTime.contains("-")) return null;
        
        try {
            String[] times = requestedTime.split(" - ");
            LocalTime reqStart = LocalTime.parse(times[0].trim());
            LocalTime reqEnd = LocalTime.parse(times[1].trim());

            for (Batch b : batches) {
                if (b.getTimingFrom() == null || b.getTimingTo() == null) continue;
                
                LocalTime bStart = LocalTime.parse(b.getTimingFrom().trim());
                LocalTime bEnd = LocalTime.parse(b.getTimingTo().trim());

                // Overlap check: (StartA < EndB) and (EndA > StartB)
                if (reqStart.isBefore(bEnd) && reqEnd.isAfter(bStart)) {
                    return "Teacher already has a batch '" + b.getName() + "' at " + b.getTimingFrom() + "-" + b.getTimingTo();
                }
            }
        } catch (Exception e) {
            // Log error or return specific message
        }
        return null;
    }
}
