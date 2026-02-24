package com.rentmanagement.config;

import org.hibernate.boot.model.naming.Identifier;
import org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl;
import org.hibernate.engine.jdbc.env.spi.JdbcEnvironment;

/**
 * Maps JPA entity/field names to Django-style database table/column names.
 * Django uses: appname_modelname for tables, lowercase_with_underscores for
 * columns.
 */
public class DjangoNamingStrategy extends PhysicalNamingStrategyStandardImpl {

    @Override
    public Identifier toPhysicalTableName(Identifier name, JdbcEnvironment context) {
        // Table names are set explicitly via @Table(name=...) on each entity
        return name;
    }

    @Override
    public Identifier toPhysicalColumnName(Identifier name, JdbcEnvironment context) {
        // Convert camelCase to snake_case for column names
        String columnName = name.getText();
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < columnName.length(); i++) {
            char c = columnName.charAt(i);
            if (Character.isUpperCase(c) && i > 0) {
                result.append('_');
            }
            result.append(Character.toLowerCase(c));
        }
        return Identifier.toIdentifier(result.toString());
    }
}
