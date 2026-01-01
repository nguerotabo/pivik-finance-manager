package com.pivik.finance_dashboard.repository;

import com.pivik.finance_dashboard.model.Earning;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EarningRepository extends JpaRepository<Earning, Long> {
    // This helps us show the newest earnings at the top
    List<Earning> findAllByOrderByDateDesc();
}