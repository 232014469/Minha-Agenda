import { useDados } from '../../dados/useDados'
import { preverIntegralizacao } from './previsao'

/** Quadro ao lado da integralização: se passar em tudo e o que falta. */
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
      </dl>
    </aside>
  )
}
