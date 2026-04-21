# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_04_20_142000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "categories", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", limit: 512, null: false
    t.string "title", limit: 512, null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_categories_on_name", unique: true
  end

  create_table "download_requests", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "manuscript_id", null: false
    t.text "rejection_reason"
    t.string "status", default: "pending", null: false
    t.bigint "student_id", null: false
    t.datetime "updated_at", null: false
    t.index ["manuscript_id"], name: "index_download_requests_on_manuscript_id"
    t.index ["student_id"], name: "index_download_requests_on_student_id"
  end

  create_table "feedbacks", force: :cascade do |t|
    t.text "content"
    t.datetime "created_at", null: false
    t.bigint "manuscript_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["manuscript_id"], name: "index_feedbacks_on_manuscript_id"
    t.index ["user_id"], name: "index_feedbacks_on_user_id"
  end

  create_table "manuscript_audit_logs", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "editor_id", null: false
    t.jsonb "field_changes", default: {}, null: false
    t.bigint "manuscript_id", null: false
    t.datetime "updated_at", null: false
    t.index ["editor_id"], name: "index_manuscript_audit_logs_on_editor_id"
    t.index ["manuscript_id"], name: "index_manuscript_audit_logs_on_manuscript_id"
  end

  create_table "manuscripts", force: :cascade do |t|
    t.text "abstract"
    t.bigint "adviser_id", null: false
    t.text "authors"
    t.date "completion_date"
    t.datetime "created_at", null: false
    t.string "file_path"
    t.string "program_or_track"
    t.string "research_type"
    t.string "status", default: "pending", null: false
    t.bigint "student_id", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["adviser_id"], name: "index_manuscripts_on_adviser_id"
    t.index ["student_id"], name: "index_manuscripts_on_student_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "message", null: false
    t.jsonb "metadata", default: {}, null: false
    t.string "notification_type", null: false
    t.datetime "read_at"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id", "read_at"], name: "index_notifications_on_user_id_and_read_at"
    t.index ["user_id"], name: "index_notifications_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "auth_id", null: false
    t.datetime "created_at", null: false
    t.string "department"
    t.string "email"
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "middle_name"
    t.string "password_digest", null: false
    t.string "program_or_track"
    t.string "role", null: false
    t.string "type", null: false
    t.datetime "updated_at", null: false
    t.string "year_level"
    t.index ["auth_id"], name: "index_users_on_auth_id", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "download_requests", "manuscripts"
  add_foreign_key "download_requests", "users", column: "student_id"
  add_foreign_key "feedbacks", "manuscripts"
  add_foreign_key "feedbacks", "users"
  add_foreign_key "manuscript_audit_logs", "manuscripts"
  add_foreign_key "manuscript_audit_logs", "users", column: "editor_id"
  add_foreign_key "manuscripts", "users", column: "adviser_id"
  add_foreign_key "manuscripts", "users", column: "student_id"
  add_foreign_key "notifications", "users"
end
