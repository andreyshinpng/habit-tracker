# Миграция базы данных

Если у вас уже запущено приложение, выполните следующую команду для обновления базы данных:

```bash
docker exec -i habit-tracker-mysql mysql -uroot -proot123 habit_tracker < migrate.sql
```

Эта команда добавит поле `sort_order` в таблицу `habits` для поддержки перетаскивания.
