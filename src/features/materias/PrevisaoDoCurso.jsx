import { useDados } from '../../dados/useDados'
import { preverIntegralizacao } from './previsao'

/** Quadro ao lado da integralização: se passar em tudo, o que falta e quando forma. */
export default function PrevisaoDoCurso({ progresso, comFluxograma = false }) {
  const { materias, semestre } = useDados()
  const previsao = preverIntegralizacao({
    progresso,
    materias,
    semestre,
    comFluxograma,
  })

  if (!previsao) return null

  const {
    agora,
    depois,
    ganho,
    ganhoObrig,
    ganhoLivres,
    faltam,
    faltamObrig,
    faltamLivres,
    obrigatoriasPendentes,
    ritmo,
    semestresDepois,
    formatura,
  } = previsao

  return (
    <aside className="fluxo-previsao" aria-labelledby="previsao-titulo">
      <h3 id="previsao-titulo">Previsão</h3>
      <dl>
        <div>
          <dt>Se passar em tudo em {semestre}</dt>
          <dd>
            {ganho > 0 ? (
              <>
                <strong>
                  {agora}% → {depois}%
                </strong>{' '}
                (+{ganho} h
                {ganhoObrig > 0 && ganhoLivres > 0
                  ? `: ${ganhoObrig} obrigatórias, ${ganhoLivres} optativas`
                  : ''}
                )
              </>
            ) : (
              'Cadastre as matérias do semestre para ver.'
            )}
          </dd>
        </div>
        <div>
          <dt>Faltam</dt>
          <dd>
            <strong>{faltam} h</strong>: {faltamObrig} h de obrigatórias
            {obrigatoriasPendentes > 0 &&
              ` (${obrigatoriasPendentes} ${obrigatoriasPendentes === 1 ? 'disciplina' : 'disciplinas'})`}{' '}
            e {faltamLivres} h de optativas e livres
          </dd>
        </div>
        {formatura && (
          <div>
            <dt>No ritmo deste semestre ({ritmo} h)</dt>
            <dd>
              {semestresDepois === 0 ? (
                <strong>Forma em {formatura}! 🎓</strong>
              ) : semestresDepois > 16 ? (
                'Mais de 8 anos. Cadastrou todas as matérias do semestre?'
              ) : (
                <>
                  Formatura em <strong>{formatura}</strong> ({semestresDepois}{' '}
                  {semestresDepois === 1 ? 'semestre' : 'semestres'} depois
                  deste)
                </>
              )}
            </dd>
          </div>
        )}
      </dl>
      <p className="fluxo-previsao-nota">
        Estimativa com a carga horária das matérias cadastradas.
      </p>
    </aside>
  )
}
