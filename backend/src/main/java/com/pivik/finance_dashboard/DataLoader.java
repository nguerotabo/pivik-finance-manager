package com.pivik.finance_dashboard;

import com.pivik.finance_dashboard.model.Invoice;
import com.pivik.finance_dashboard.repository.InvoiceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

@Component
public class DataLoader implements CommandLineRunner {

    private final InvoiceRepository repository;

    // Constructor Injection (Best Practice)
    public DataLoader(InvoiceRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Only load data if the database is empty
        if (repository.count() == 0) {
            Invoice i2 = new Invoice();
            i2.setVendor("Pepsi");
            i2.setAmount(250.0);
            i2.setDate(LocalDate.now());
            i2.setCategory("Beverages");
            i2.setStatus("Paid");
            
            repository.save(i2);

            System.out.println("✅ Sample data loaded: PepsiCo Invoice");
        }
    }
}