class CreateCategories < ActiveRecord::Migration[8.1]
  DEFAULT_CATEGORIES = [
    { title: "Bachelor Degrees", name: "BS Computer Science" },
    { title: "Bachelor Degrees", name: "BS Information Technology" },
    { title: "Bachelor Degrees", name: "BS Education" },
    { title: "Bachelor Degrees", name: "BS Business Administration" },
    { title: "Bachelor Degrees", name: "BS Nursing" },
    { title: "Bachelor Degrees", name: "BS Electronics and Communications Engineering" },
    { title: "Bachelor Degrees", name: "BS Civil Engineering" },
    { title: "Diploma Programs", name: "Diploma in Information and Communications Technology" },
    { title: "Diploma Programs", name: "Diploma in Business Administration" },
    { title: "Diploma Programs", name: "Diploma in Hospitality and Tourism" },
    { title: "Senior High School — Academic Track", name: "STEM (Science, Technology, Engineering, and Mathematics)" },
    { title: "Senior High School — Academic Track", name: "ABM (Accountancy, Business and Management)" },
    { title: "Senior High School — Academic Track", name: "HUMSS (Humanities and Social Sciences)" },
    { title: "Senior High School — Academic Track", name: "GAS (General Academic Strand)" },
    { title: "Senior High School — TVL Track", name: "TVL — Information and Communications Technology (ICT)" },
    { title: "Senior High School — TVL Track", name: "TVL — Home Economics (HE)" },
    { title: "Senior High School — TVL Track", name: "TVL — Industrial Arts (IA)" },
    { title: "Senior High School — TVL Track", name: "TVL — Agri-Fishery Arts (AFA)" }
  ].freeze

  def change
    create_table :categories do |t|
      t.string :title, null: false, limit: 512
      t.string :name, null: false, limit: 512

      t.timestamps
    end

    add_index :categories, :name, unique: true

    reversible do |dir|
      dir.up do
        now = Time.current
        Category.insert_all!(
          DEFAULT_CATEGORIES.map { |category| category.merge(created_at: now, updated_at: now) }
        )
      end
    end
  end
end
