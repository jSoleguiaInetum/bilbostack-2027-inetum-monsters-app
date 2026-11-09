# Configuración de Selección de Modelos

Para optimizar la calidad de las respuestas y la eficiencia de costes, los agentes deben utilizar los siguientes modelos según el tipo de tarea:

| Tipo de Tarea | Modelo Recomendado | Justificación |
| :--- | :--- | :--- |
| **Configuración / Documentación** | `Qwen3.8 Flash` | Cambios en directrices, documentación o configuraciones del proyecto. |
| **Arquitectura / Diseño** | `GLM-5.3 Flash` | Razonamiento complejo y decisiones de alto nivel. |
| **Implementación (Coding)** | `GLM-5.3 Flash` | Equilibrio entre capacidad y velocidad para escribir código. |
| **Refactorización / Bugs** | `GLM-5.3 Flash` | Precisión lógica necesaria para mantener la estabilidad. |
| **Investigación / Exploración** | `GLM-5.3 Flash` | Capacidad de análisis rápido de código. |
| **Testing E2E** | `MiniMax M3.1 Flash` | Ejecución y validación de flujos completos. |
| **Pruebas de carga** | `DeepSeek V4.1 Flash (variant low)` | Análisis de rendimiento bajo estrés. |
| **Tareas triviales / Archivo** | `Qwen3.8 Flash` | Eficiencia máxima para tareas mecánicas. |

> **Nota:** Si una tarea es crítica, ambigua o de alto impacto arquitectónico, prioriza el uso de `opus` independientemente de la tabla anterior.
