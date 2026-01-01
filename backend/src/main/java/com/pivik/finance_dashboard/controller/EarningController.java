package com.pivik.finance_dashboard.controller;

import com.pivik.finance_dashboard.model.Earning;
import com.pivik.finance_dashboard.repository.EarningRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/earnings")
@CrossOrigin(origins = "http://localhost:5173")
public class EarningController {

    private final EarningRepository repository;

    public EarningController(EarningRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Earning> getAll() {
        return repository.findAllByOrderByDateDesc();
    }

    @PostMapping
    public Earning create(@RequestBody Earning earning) {
        return repository.save(earning);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}