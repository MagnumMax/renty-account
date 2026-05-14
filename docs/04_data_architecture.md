# 🗄️ Data Model (Architecture)

Основываясь на утвержденных функциональных требованиях (B2C, Штрафы, Инвойсы, Upsells, Soft Delete), вот структура ключевых сущностей базы данных.

**1. `User` (Пользователь / Клиент B2C)**
- **id**: UUID (Primary Key)
- **email**: String (Unique)
- **phone**: String
- **first_name**: String
- **last_name**: String
- **auth_provider**: Enum (`EMAIL_OTP`, `GOOGLE`, `APPLE`) -> Указывает метод регистрации
- **provider_id**: String -> ID пользователя в Google/Apple (если вход через соцсети)
- **documents**: JSONB (Ссылки на загруженные права/паспорт)
- **is_active**: Boolean (Default: true) -> Флаг для реализации **Soft Delete**
- **deleted_at**: Timestamp (Null по умолчанию, заполняется при Soft Delete)
- **created_at**: Timestamp
- **Связи**: 
  - `has_many`: Bookings
  - `has_many`: Invoices
  - `has_many`: WishlistItems

**2. `Booking` (Бронирование)**
- **id**: UUID (Primary Key)
- **user_id**: UUID (Foreign Key -> User)
- **car_id**: UUID (Foreign Key -> Car в основной БД каталога)
- **status**: Enum (`PENDING_PAYMENT`, `CONFIRMED`, `ACTIVE`, `COMPLETED`, `CANCELLED`)
- **start_date**: Timestamp
- **end_date**: Timestamp
- **pickup_location_id**: UUID
- **dropoff_location_id**: UUID
- **total_price**: Decimal
- **currency**: String
- **created_at**: Timestamp
- **updated_at**: Timestamp
- **Связи**: 
  - `belongs_to`: User
  - `has_many`: BookingAddons
  - `has_many`: Invoices
  - `has_many`: Fines

**3. `BookingAddon` (Связующая таблица для Upsells)**
- **id**: UUID
- **booking_id**: UUID (Foreign Key -> Booking)
- **addon_id**: UUID (Foreign Key -> Addon каталог услуг)
- **quantity**: Integer (например, 2 детских кресла)
- **price_at_booking**: Decimal (Фиксация цены на момент заказа)
- **status**: Enum (`ADDED_AT_CHECKOUT`, `ADDED_DURING_RENTAL`)

**4. `Invoice` (Инвойсы - основной финансовый документ)**
- **id**: UUID (Primary Key)
- **user_id**: UUID (Foreign Key -> User)
- **booking_id**: UUID (Foreign Key -> Booking, nullable если инвойс не привязан жестко)
- **type**: Enum (`RENTAL`, `EXTENSION`, `ADDON`, `TOLL`, `FINE`, `DAMAGE`)
- **status**: Enum (`UNPAID`, `PAID`, `CANCELLED`, `REFUNDED`)
- **amount**: Decimal
- **currency**: String
- **due_date**: Timestamp
- **payment_link_url**: String (Ссылка на Stripe Payment Link)
- **pdf_url**: String (Ссылка на сгенерированный PDF документ)
- **created_at**: Timestamp
- **paid_at**: Timestamp
- **Связи**:
  - `belongs_to`: User
  - `belongs_to`: Booking
  - `has_one`: Fine (если тип инвойса = FINE)

**5. `Fine` (Штрафы - детализация)**
*Сущность вынесена отдельно, так как требует специфичных данных (фото доказательств, номер постановления).*
- **id**: UUID (Primary Key)
- **invoice_id**: UUID (Foreign Key -> Invoice)
- **booking_id**: UUID (Foreign Key -> Booking)
- **violation_date**: Timestamp
- **violation_type**: String (Например: "Speeding", "Parking")
- **police_reference_number**: String (Номер постановления)
- **evidence_urls**: Array of Strings / JSONB (Ссылки на фото/сканы с камер)
- **description**: Text
- **Связи**:
  - `belongs_to`: Invoice
  - `belongs_to`: Booking
