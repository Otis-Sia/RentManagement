package com.rentmanagement.repository;

import com.rentmanagement.domain.MessageRecipient;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.jpa.repository.JpaRepository;
import java.util.List;

@Repository
public interface MessageRecipientRepository extends JpaRepository<MessageRecipient, Long> {
    List<MessageRecipient> findByMessageId(Long messageId);

    long countByMessageId(Long messageId);

    long countByMessageIdAndIsReadTrue(Long messageId);

    long countByMessageIdAndWhatsappStatus(Long messageId, MessageRecipient.WhatsAppStatus status);
}
