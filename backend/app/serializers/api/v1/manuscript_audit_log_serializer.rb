class Api::V1::ManuscriptAuditLogSerializer < ActiveModel::Serializer
  attributes :id, :editor_id, :editor_name, :editor_role, :field_changes, :created_at

  def editor_name
    editor = object.editor
    return nil unless editor

    [editor.first_name, editor.middle_name, editor.last_name].compact.join(" ")
  end

  def editor_role
    object.editor&.role
  end
end
