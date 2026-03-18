
<?php
// Endpoint: GET /plans/{id}/details
// Retorna detalhes do plano + lista de assinantes ativos

// Este código deve ser adicionado ao PlansController.php no método adequado
// ou como uma rota separada

/*
  Adicione ao PlansController.php:

  public function getDetails($id) {
      try {
          // Buscar plano
          $query = "SELECT * FROM plans WHERE id = ?";
          $stmt = $this->db->prepare($query);
          $stmt->execute([$id]);
          $plan = $stmt->fetch(PDO::FETCH_ASSOC);
          
          if (!$plan) {
              http_response_code(404);
              echo json_encode(['success' => false, 'error' => 'Plano não encontrado']);
              return;
          }
          
          // Buscar assinantes ativos
          $query = "SELECT us.user_id, u.full_name, u.email, u.login, us.status, us.start_date, us.end_date
                   FROM user_subscriptions us
                   JOIN usuarios u ON us.user_id = u.id
                   WHERE us.plan_id = ? AND us.status = 'active'
                   ORDER BY us.end_date ASC";
          $stmt = $this->db->prepare($query);
          $stmt->execute([$id]);
          $subscribers = $stmt->fetchAll(PDO::FETCH_ASSOC);
          
          echo json_encode([
              'success' => true,
              'data' => [
                  'plan' => $plan,
                  'subscribers' => $subscribers
              ]
          ]);
      } catch (Exception $e) {
          http_response_code(500);
          echo json_encode(['success' => false, 'error' => 'Erro ao buscar detalhes: ' . $e->getMessage()]);
      }
  }

  Adicione ao routes/plans.php:
  
  case 'GET':
      if (isset($pathParts[1]) && $pathParts[1] === 'details') {
          $controller->getDetails($pathParts[0]);
      }
      break;
*/
