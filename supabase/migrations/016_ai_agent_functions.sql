-- ============================================
-- 016: AI Agent Helper Functions
-- Functions for AI Agent to query data bypassing RLS
-- ============================================

-- ============================================
-- 1. Function to get ticket detail for AI Agent
-- ============================================
CREATE OR REPLACE FUNCTION ai_get_ticket_detail(
  p_ticket_id UUID,
  p_org_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', t.id,
    'title', t.title,
    'description', t.description,
    'category', t.category,
    'priority', t.priority,
    'status', t.status,
    'created_at', t.created_at,
    'updated_at', t.updated_at,
    'resolved_at', t.resolved_at,
    'closed_at', t.closed_at,
    'contact', jsonb_build_object(
      'id', c.id,
      'first_name', c.first_name,
      'last_name', c.last_name,
      'phone', c.phone,
      'email', c.email
    ),
    'assignee', jsonb_build_object(
      'first_name', p1.first_name,
      'last_name', p1.last_name
    ),
    'reporter', jsonb_build_object(
      'first_name', p2.first_name,
      'last_name', p2.last_name
    )
  )
  INTO v_result
  FROM tickets t
  LEFT JOIN contacts c ON c.id = t.contact_id
  LEFT JOIN profiles p1 ON p1.id = t.assignee_id
  LEFT JOIN profiles p2 ON p2.id = t.reporter_id
  WHERE t.id = p_ticket_id
    AND t.org_id = p_org_id;

  RETURN v_result;
END;
$$;

-- ============================================
-- 2. Function to get ticket comments for AI Agent
-- ============================================
CREATE OR REPLACE FUNCTION ai_get_ticket_comments(
  p_ticket_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', tc.id,
      'content', tc.content,
      'created_at', tc.created_at,
      'author', jsonb_build_object(
        'first_name', p.first_name,
        'last_name', p.last_name
      )
    ) ORDER BY tc.created_at ASC
  )
  INTO v_result
  FROM ticket_comments tc
  LEFT JOIN profiles p ON p.id = tc.author_id
  WHERE tc.ticket_id = p_ticket_id;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- ============================================
-- 3. Function to get deal detail for AI Agent
-- ============================================
CREATE OR REPLACE FUNCTION ai_get_deal_detail(
  p_deal_id UUID,
  p_org_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', d.id,
    'title', d.title,
    'value', d.value,
    'currency', d.currency,
    'status', d.status,
    'expected_close_date', d.expected_close_date,
    'actual_close_date', d.actual_close_date,
    'won_lost_reason', d.won_lost_reason,
    'source', d.source,
    'created_at', d.created_at,
    'contact', jsonb_build_object(
      'id', c.id,
      'first_name', c.first_name,
      'last_name', c.last_name,
      'phone', c.phone,
      'email', c.email
    ),
    'company', jsonb_build_object(
      'id', comp.id,
      'name', comp.name
    ),
    'stage', jsonb_build_object(
      'name', ps.name,
      'is_won', ps.is_won,
      'is_lost', ps.is_lost
    ),
    'owner', jsonb_build_object(
      'first_name', p.first_name,
      'last_name', p.last_name
    )
  )
  INTO v_result
  FROM deals d
  LEFT JOIN contacts c ON c.id = d.contact_id
  LEFT JOIN companies comp ON comp.id = d.company_id
  LEFT JOIN pipeline_stages ps ON ps.id = d.stage_id
  LEFT JOIN profiles p ON p.id = d.owner_id
  WHERE d.id = p_deal_id
    AND d.org_id = p_org_id;

  RETURN v_result;
END;
$$;

-- ============================================
-- 4. Function to get deal notes for AI Agent
-- ============================================
CREATE OR REPLACE FUNCTION ai_get_deal_notes(
  p_deal_id UUID,
  p_org_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', n.id,
      'content', n.content,
      'created_at', n.created_at,
      'author', jsonb_build_object(
        'first_name', p.first_name,
        'last_name', p.last_name
      )
    ) ORDER BY n.created_at DESC
  )
  INTO v_result
  FROM notes n
  LEFT JOIN profiles p ON p.id = n.author_id
  WHERE n.deal_id = p_deal_id
    AND n.org_id = p_org_id;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- ============================================
-- 5. Function to get note detail for AI Agent
-- ============================================
CREATE OR REPLACE FUNCTION ai_get_note_detail(
  p_note_id UUID,
  p_org_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', n.id,
    'content', n.content,
    'created_at', n.created_at,
    'updated_at', n.updated_at,
    'contact', jsonb_build_object(
      'id', c.id,
      'first_name', c.first_name,
      'last_name', c.last_name
    ),
    'deal', jsonb_build_object(
      'id', d.id,
      'title', d.title
    ),
    'company', jsonb_build_object(
      'id', comp.id,
      'name', comp.name
    ),
    'author', jsonb_build_object(
      'first_name', p.first_name,
      'last_name', p.last_name
    )
  )
  INTO v_result
  FROM notes n
  LEFT JOIN contacts c ON c.id = n.contact_id
  LEFT JOIN deals d ON d.id = n.deal_id
  LEFT JOIN companies comp ON comp.id = n.company_id
  LEFT JOIN profiles p ON p.id = n.author_id
  WHERE n.id = p_note_id
    AND n.org_id = p_org_id;

  RETURN v_result;
END;
$$;

-- ============================================
-- 6. Function to get task detail for AI Agent
-- ============================================
CREATE OR REPLACE FUNCTION ai_get_task_detail(
  p_task_id UUID,
  p_org_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', t.id,
    'title', t.title,
    'description', t.description,
    'due_date', t.due_date,
    'priority', t.priority,
    'status', t.status,
    'created_at', t.created_at,
    'completed_at', t.completed_at,
    'contact', jsonb_build_object(
      'id', c.id,
      'first_name', c.first_name,
      'last_name', c.last_name
    ),
    'deal', jsonb_build_object(
      'id', d.id,
      'title', d.title
    ),
    'assignee', jsonb_build_object(
      'first_name', p.first_name,
      'last_name', p.last_name
    )
  )
  INTO v_result
  FROM tasks t
  LEFT JOIN contacts c ON c.id = t.contact_id
  LEFT JOIN deals d ON d.id = t.deal_id
  LEFT JOIN profiles p ON p.id = t.assignee_id
  WHERE t.id = p_task_id
    AND t.org_id = p_org_id;

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION ai_get_ticket_detail(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION ai_get_ticket_comments(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION ai_get_deal_detail(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION ai_get_deal_notes(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION ai_get_note_detail(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION ai_get_task_detail(UUID, UUID) TO authenticated;
