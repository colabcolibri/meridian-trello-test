-- Workflow column labels — English UI

UPDATE workflow_columns SET name = 'Ready' WHERE name = 'Pronta';
UPDATE workflow_columns SET name = 'In progress' WHERE name = 'Em progresso';
UPDATE workflow_columns SET name = 'Review' WHERE name = 'Revisão';
UPDATE workflow_columns SET name = 'Done' WHERE name = 'Concluída';
